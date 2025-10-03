import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "GlutenScan",
  description: "Analysez les ingrédients de vos produits pour détecter le gluten",
  metadataBase: new URL("https://glutenscan.example.com"),
  openGraph: {
    title: "GlutenScan",
    description: "Détectez rapidement le gluten dans vos produits",
    url: "https://glutenscan.example.com",
    siteName: "GlutenScan"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
