import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "GlutenScan",
  description: "Analysez les ingr�dients de vos produits pour d�tecter le gluten",
  metadataBase: new URL("https://glutenscan.example.com"),
  openGraph: {
    title: "GlutenScan",
    description: "D�tectez rapidement le gluten dans vos produits",
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
