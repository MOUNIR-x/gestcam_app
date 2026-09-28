import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { db } from '../data/store';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// Require authentication for AI access (prevents anonymous data leakage)
router.use(authMiddleware);

// POST /api/ai/copilot
router.post('/copilot', async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message requis' });
  }

  // Compile real business snapshot for Gemini context
  const lowStockProducts = db.products.filter(p => p.stockCurrent <= p.stockMin);
  const totalBalance = db.treasuryAccounts.reduce((sum, a) => sum + a.balance, 0);
  const pendingInvoices = db.invoices.filter(i => i.status === 'EN_ATTENTE' || i.status === 'EN_RETARD');
  const totalImpayes = pendingInvoices.reduce((sum, i) => sum + i.netAPayer, 0);

  const contextSnapshot = `
Informations actuelles de la PME Camerounaise :
- Raison sociale: ${db.company.name} (${db.company.city}, Régime: ${db.company.regime}, NIU: ${db.company.niu})
- Trésorerie globale disponible: ${totalBalance.toLocaleString('fr-FR')} FCFA
- Factures impayées/en attente: ${pendingInvoices.length} factures pour un montant total de ${totalImpayes.toLocaleString('fr-FR')} FCFA
- Ruptures/Alertes de stock (${lowStockProducts.length}): ${lowStockProducts.map(p => `${p.name} (Stock: ${p.stockCurrent} / Min: ${p.stockMin})`).join(', ') || 'Aucune rupture critique'}
- Alertes anti-fraude en cours: ${db.fraudAlerts.length}
`;

  const systemInstruction = `
Tu es le Copilote IA officiel de GestCam, expert en gestion commerciale, finance d'entreprise et comptabilité OHADA pour les PME au Cameroun (Douala, Yaoundé, Bafoussam, Garoua, etc.).
Tu as accès aux données réelles de l'entreprise :
${contextSnapshot}

Règles de réponse :
1. Réponds toujours en français professionnel, précis, bienveillant et orienté résultat.
2. Utilise le FCFA pour tous les montants monétaires.
3. Connais parfaitement les spécificités camerounaises : TVA 19.25%, précompte AIRS 2.2% ou 5.5%, déclarations DGI avant le 15 du mois, paiements MTN Mobile Money / Orange Money, gestion des stocks en CMUP.
4. Fournis des recommandations actionnables avec des étapes concrètes.
5. Sois concis et structure avec des tirets ou puces lorsque c'est pertinent.
`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: message,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || 'Analyse terminée avec succès.';

      return res.json({
        reply: replyText,
        source: 'gemini-3.8-flash',
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, using intelligent rule-based engine:', err?.message);
    }
  }

  // Intelligent context-aware fallback if Gemini API key is absent or network fails
  const q = message.toLowerCase();
  let fallbackReply = '';

  if (q.includes('stock') || q.includes('rupture') || q.includes('approvisionnement')) {
    if (lowStockProducts.length > 0) {
      fallbackReply = `⚠️ **Alerte Stock critique (${lowStockProducts.length} articles à réapprovisionner)** :\n\n` +
        lowStockProducts.map(p => `• **${p.name}** : Reste ${p.stockCurrent} ${p.unit} (Seuil min : ${p.stockMin}). Coût moyen pondéré (CMUP) : ${p.cmup.toLocaleString('fr-FR')} FCFA.`).join('\n') +
        `\n\n💡 **Recommandation GestCam** : Générez immédiatement un bon de commande vers vos fournisseurs principaux pour sécuriser les livraisons avant rupture totale.`;
    } else {
      fallbackReply = `✅ Tous vos stocks sont actuellement à des niveaux optimaux au-dessus de leurs seuils minimaux. La valorisation totale de votre stock est saine.`;
    }
  } else if (q.includes('impot') || q.includes('tva') || q.includes('dgi') || q.includes('taxe') || q.includes('fiscal')) {
    fallbackReply = `🏛️ **Point Fiscal DGI Cameroun (Loi de Finances 2026)** :\n\n` +
      `• **Régime** : ${db.company.regime} (${db.company.cdi})\n` +
      `• **TVA applicable** : 19.25% (17.5% principal + 10% Centimes Additionnels Communaux)\n` +
      `• **Précompte AIRS** : 2.2% sur clients immatriculés (5.5% si sans NIU)\n` +
      `• **Échéance** : Télédéclaration et versement exigibles au plus tard le **15 du mois** sur la plateforme DGI e-Bulletin.`;
  } else if (q.includes('tresorerie') || q.includes('solde') || q.includes('cash') || q.includes('argent') || q.includes('momo')) {
    fallbackReply = `💰 **Synthèse Trésorerie GestCam** :\n\n` +
      `• **Solde global disponible** : **${totalBalance.toLocaleString('fr-FR')} FCFA**\n` +
      `• **Créances clients en attente** : **${totalImpayes.toLocaleString('fr-FR')} FCFA** sur ${pendingInvoices.length} factures.\n\n` +
      `💡 **Action prioritaire** : Relancez vos clients débiteurs par notification WhatsApp avec lien de règlement MTN Mobile Money / Orange Money direct pour accélérer vos encaissements.`;
  } else {
    fallbackReply = `Bonjour ! Je suis le copilote GestCam. Votre PME "${db.company.name}" dispose actuellement d'une trésorerie active de **${totalBalance.toLocaleString('fr-FR')} FCFA** et de **${db.products.length} articles** référencés au catalogue.\n\nComment puis-je vous assister aujourd'hui ? (Analyse de rentabilité, audit anti-fraude, calcul fiscal OHADA, relance client).`;
  }

  res.json({
    reply: fallbackReply,
    source: 'gestcam-rules-engine',
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  });
});

export default router;
