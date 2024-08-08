import {
	Box,
	Coins,
	File,
	LayoutDashboardIcon,
	List,
	Lock,
	User,
} from "lucide-react";

export const navItems: any[] = [
	{
		title: "Dashboard",
		href: "/user",
		icon: LayoutDashboardIcon,
		label: "Dashboard",
	},
	{
		title: "Products",
		href: "/user/product",
		icon: Box,
		label: "Products",
	},
	{
		title: "Invoice",
		href: "/user/invoice",
		icon: Coins,
		label: "Invoice",
	},
	{
		title: "Category",
		href: "/user/category",
		icon: List,
		label: "Category",
	},
	{
		title: "Users",
		href: "/user/users",
		icon: Lock,
		label: "Users",
	},
	{
		title: "User",
		href: "/user/settings",
		icon: User,
		label: "User",
	},
];
