"use client";

import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using HashPrediction (the \"Platform\"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform. These terms constitute a legally binding agreement between you and HashPrediction.",
  },
  {
    title: "2. Platform Description",
    content:
      "HashPrediction is a decentralized binary prediction market platform deployed on HashKey Chain testnet. Users can create markets, place bets using mUSDC test tokens, and claim payouts based on market outcomes. The Platform is provided for educational and experimental purposes only.",
  },
  {
    title: "3. Testnet Disclaimer",
    content:
      "HashPrediction currently operates on a blockchain testnet. All tokens (mUSDC) used on the Platform are test tokens with no real monetary value. No real money is involved in any transaction on the Platform. The Platform may be reset, modified, or discontinued at any time without prior notice.",
  },
  {
    title: "4. Eligibility",
    content:
      "You must be at least 18 years old to use the Platform. By using the Platform, you represent and warrant that you meet this age requirement and that your use complies with all applicable local, state, national, and international laws and regulations.",
  },
  {
    title: "5. User Responsibilities",
    content:
      "You are solely responsible for: (a) maintaining the security of your wallet and private keys; (b) all activity that occurs under your wallet address; (c) ensuring your use of the Platform complies with applicable laws; (d) any tax obligations that may arise from your use of the Platform.",
  },
  {
    title: "6. Market Creation & Resolution",
    content:
      "Markets are created by users and resolved by the market creator or platform administrators. HashPrediction does not guarantee the accuracy, fairness, or timeliness of market resolutions. Markets may be cancelled at the discretion of administrators if they violate platform guidelines or are deemed unresolvable.",
  },
  {
    title: "7. Smart Contract Risks",
    content:
      "The Platform relies on smart contracts deployed on HashKey Chain. These smart contracts are unaudited and may contain bugs or vulnerabilities. By using the Platform, you acknowledge and accept the inherent risks of interacting with smart contracts, including but not limited to: loss of funds, contract exploits, and blockchain network issues.",
  },
  {
    title: "8. No Financial Advice",
    content:
      "Nothing on the Platform constitutes financial, investment, legal, or tax advice. The Platform is for informational and entertainment purposes only. You should consult with qualified professionals before making any financial decisions.",
  },
  {
    title: "9. Prohibited Conduct",
    content:
      "You agree not to: (a) manipulate markets or engage in wash trading; (b) create markets with misleading or impossible-to-verify questions; (c) use the Platform for money laundering or any illegal activity; (d) attempt to exploit smart contract vulnerabilities; (e) harass other users or disrupt the Platform's operation.",
  },
  {
    title: "10. Limitation of Liability",
    content:
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, HASHPREDICTION AND ITS DEVELOPERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM. THE PLATFORM IS PROVIDED \"AS IS\" WITHOUT WARRANTIES OF ANY KIND.",
  },
  {
    title: "11. Privacy",
    content:
      "The Platform interacts with public blockchain networks. All transactions are publicly visible on the blockchain. We do not collect personal information beyond what is inherently public on the blockchain. We may use analytics to improve the Platform experience.",
  },
  {
    title: "12. Modifications",
    content:
      "We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Platform after changes constitutes acceptance of the modified Terms.",
  },
  {
    title: "13. Contact",
    content:
      "For questions about these Terms, please reach out via the project's GitHub repository or community channels.",
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          <span className="gradient-text">Terms of Service</span>
        </h1>
        <p className="text-[#a1a1aa] mb-8">Last updated: February 3, 2026</p>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              className="glass-card p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <h2 className="text-base font-bold text-white mb-3">
                {section.title}
              </h2>
              <p className="text-sm text-[#a1a1aa] leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
