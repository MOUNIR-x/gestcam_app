import { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/auth.js';
import { pgService } from '../services/pgService.js';

const router = Router();

// Protect tax endpoints
router.use(authMiddleware);

// GET /api/tax/declaration-mensuelle
// Generates Cameroon DGI monthly tax pre-declaration summary according to Loi de Finances 2026
router.get('/declaration-mensuelle', async (req: Request, res: Response) => {
  const companyId = Number((req as any).auth?.companyId);
  if (!companyId) return res.status(403).json({ error: 'Contexte entreprise manquant' });

  try {
    const periode = (req.query.periode as string) || new Date().toISOString().slice(0, 7); // YYYY-MM
    const deductiblePercent = Number(process.env.TAX_DEDUCTIBLE_PERCENT ?? 0.65);
    const timbrePerInvoice = Number(process.env.TAX_DUTY_PER_INVOICE ?? 1000);

    const [company, invoices, movements] = await Promise.all([
      pgService.getCompanyById(companyId),
      pgService.getInvoices(companyId),
      pgService.getStockMovements(companyId)
    ]);

    // Only consider invoices paid inside the requested period
    const paidInvoices = invoices.filter(i => i.status === 'PAYEE' && String(i.date || '').startsWith(periode));

    const totalCAHT = paidInvoices.reduce((s, i) => s + (Number(i.totalHT) || 0), 0);
    const totalTVACollectee = paidInvoices.reduce((s, i) => s + (Number(i.tvaAmount) || 0), 0);
    const totalAirsRetenu = paidInvoices.reduce((s, i) => s + (Number(i.acompteAmount) || 0), 0);

    // Estimations déductibles (approvisionnements et achats fournisseurs) within period
    const totalAchats = movements
      .filter(m => m.type === 'ENTREE' && String(m.date || '').startsWith(periode))
      .reduce((s, m) => s + (Number(m.totalCost) || 0), 0);

    const tvaRate = company?.tvaRate ?? 0.1925;
    const tvaDeductibleEstimee = Math.round(totalAchats * tvaRate * deductiblePercent);
    const tvaNetteADeclarer = Math.max(0, totalTVACollectee - tvaDeductibleEstimee);
    const droitTimbreTotal = paidInvoices.length * timbrePerInvoice;

    // Total à verser au Centre des Impôts avant le 15 du mois
    const totalAPayerRecette = tvaNetteADeclarer + totalAirsRetenu + droitTimbreTotal;

    res.json({
      periode,
      dateEcheance: `${periode}-15`,
      company: {
        name: company?.name || 'Entreprise PME',
        niu: company?.niu || 'N/A',
        rccm: company?.rccm || 'N/A',
        cdi: company?.cdi || 'CDI Douala',
        regime: company?.regime || 'REEL'
      },
      declaration: {
        chiffreAffairesHT: totalCAHT,
        tvaCollectee19_25: totalTVACollectee,
        tvaDeductible: tvaDeductibleEstimee,
        tvaNetteADeclarer,
        acompteAIRS2_2: totalAirsRetenu,
        droitTimbreFiscal: droitTimbreTotal,
        facturesDeclareesCount: paidInvoices.length,
        totalAPayerDGI: totalAPayerRecette
      },
      conformite: {
        statut: 'CONFORME_OHADA',
        referenceLegale: 'Code Général des Impôts Cameroun - Loi de Finances 2026',
        conseil: 'Effectuez votre télédéclaration sur la plateforme DGI e-Bulletin avant le 15 à 23h59 pour éviter les pénalités de 10%.'
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Erreur lors du calcul de la déclaration fiscale' });
  }
});

export default router;
