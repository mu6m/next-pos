import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import "@/app/globals.css";
import React from "react";

export const metadata: Metadata = {
	title: "dashboard | POS",
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<html lang="en">
				<body className="bg-muted">
					<Toaster />
					<main className="px-6 py-8 mx-auto bg-white">{children}</main>
				</body>
			</html>
		</>
	);
}
