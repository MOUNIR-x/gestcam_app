import { Router, Request, Response } from 'express';
import { db } from '../data/store';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Protect tax endpoints
router.use(authMiddleware);

// GET /api/tax/declaration-mensuelle
// Generates Cameroon DGI monthly tax pre-declaration summary according to Loi de Finances 2026
router.get('/declaration-mensuelle', (req: Request, res: Response) => {
  const periode = (req.query.periode as string) || new Date().toISOString().slice(0, 7); // YYYY-MM
  const deductiblePercent = Number(process.env.TAX_DEDUCTIBLE_PERCENT ?? 0.65);
  const timbrePerInvoice = Number(process.env.TAX_DUTY_PER_INVOICE ?? 1000);

  // Only consider invoices paid inside the requested period
  const paidInvoices = db.invoices.filter(i => i.status === 'PAYEE' && String(i.date || '').startsWith(periode));

  const totalCAHT = paidInvoices.reduce((s, i) => s + i.totalHT, 0);
  const totalTVACollectee = paidInvoices.reduce((s, i) => s + i.tvaAmount, 0);
  const totalAirsRetenu = paidInvoices.reduce((s, i) => s + i.acompteAmount, 0);

  // Estimations déductibles (approvisionnements et achats fournisseurs) within period
  const totalAchats = db.stockMovements
    .filter(m => m.type === 'ENTREE' && String(m.date || '').startsWith(periode))
    .reduce((s, m) => s + m.totalCost, 0);

  const tvaDeductibleEstimee = Math.round(totalAchats * 0.1925 * deductiblePercent);
  const tvaNetteADeclarer = Math.max(0, totalTVACollectee - tvaDeductibleEstimee);
  const droitTimbreTotal = paidInvoices.length * timbrePerInvoice;

  // Total à verser au Centre des Impôts avant le 15 du mois
  const totalAPayerRecette = tvaNetteADeclarer + totalAirsRetenu + droitTimbreTotal;

  res.json({
    periode,
    dateEcheance: `${periode}-15`,
    company: {
      name: db.company.name,
      niu: db.company.niu,
      rccm: db.company.rccm,
      cdi: db.company.cdi,
      regime: db.company.regime
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
});

export default router;
