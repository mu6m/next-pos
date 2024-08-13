"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

export default function Component({ product, mutate }: any) {
	const { toast } = useToast();
	const [selectedItems, setSelectedItems]: any = useState([]);
	const [loading, setLoading]: any = useState(false);
	const handleAddToOrder = (item: any) => {
		setSelectedItems((prevItems: any) => {
			const itemExists = prevItems.some(
				(selectedItem: any) => selectedItem.id === item.id
			);

			if (itemExists) {
				return prevItems.map((selectedItem: any) =>
					selectedItem.id === item.id
						? { ...selectedItem, quantity: selectedItem.quantity + 1 }
						: selectedItem
				);
			} else {
				return [...prevItems, { ...item, quantity: 1 }];
			}
		});
	};

	const handleRemoveFromOrder = (itemId: any) => {
		setSelectedItems(selectedItems.filter((item: any) => item.id !== itemId));
	};
	const handleQuantityChange = (itemId: any, quantity: any) => {
		setSelectedItems(
			selectedItems.map((item: any) =>
				item.id === itemId ? { ...item, quantity } : item
			)
		);
	};
	const totalAmount = selectedItems.reduce(
		(total: any, item: any) => total + item.price * item.quantity,
		0
	);
	return (
		<div className="flex h-screen">
			<div className="flex-1 bg-background p-6 overflow-y-auto">
				<h2 className="text-2xl font-bold mb-4">Menu</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{product.map((item: any) => (
						<div
							key={item.id}
							className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
							onClick={() => handleAddToOrder(item)}
						>
							<h3 className="text-lg font-bold mb-2">{item.title}</h3>
							<p className="text-muted-foreground mb-4">{item.content}</p>
							<div className="flex flex-col justify-between">
								<span className="font-bold">${item.price.toFixed(2)}</span>
								{item.limit > -1 && <span>limit: {item.limit}</span>}
								<Button size="sm" variant="outline">
									Add to Order
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
			<div className="bg-muted p-6 w-80 flex flex-col">
				<h2 className="text-2xl font-bold mb-4">Order</h2>
				<div className="flex-1 overflow-y-auto">
					{selectedItems.length === 0 ? (
						<p className="text-muted-foreground">No items in your order.</p>
					) : (
						<ul className="space-y-4">
							{selectedItems.map((item: any) => (
								<li
									key={item.id}
									className="bg-card p-4 rounded-lg shadow-md flex justify-between items-center"
								>
									<div>
										<h3 className="text-lg font-bold">{item.title}</h3>
										<p className="text-muted-foreground">
											${item.price.toFixed(2)} x {item.quantity}
										</p>
									</div>
									<div className="flex items-center gap-2">
										<Button
											size="sm"
											variant="ghost"
											onClick={() =>
												handleQuantityChange(item.id, item.quantity - 1)
											}
											disabled={item.quantity === 1}
										>
											-
										</Button>
										<span>{item.quantity}</span>
										<Button
											size="sm"
											variant="ghost"
											onClick={() =>
												handleQuantityChange(item.id, item.quantity + 1)
											}
										>
											+
										</Button>
										<Button
											size="sm"
											variant="ghost"
											onClick={() => handleRemoveFromOrder(item.id)}
										>
											<XIcon className="w-4 h-4" />
										</Button>
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
				<div className="mt-4 bg-card p-4 rounded-lg shadow-md">
					<div className="flex justify-between items-center mb-2">
						<span className="font-bold">Total:</span>
						<span className="font-bold">${totalAmount.toFixed(2)}</span>
					</div>
					<Button
						className="w-full"
						onClick={async () => {
							setLoading(true);
							try {
								console.log(selectedItems);
								const { data } = await axios.post("/pos/action", selectedItems);
								toast({
									variant: data.success ? "default" : "destructive",
									title: data.message,
								});
								if (data.success) {
									await mutate();
									// setSelectedItems([]);
								}
							} catch {
								toast({
									variant: "destructive",
									title: "api error",
								});
							} finally {
								setLoading(false);
							}
						}}
						disabled={loading}
					>
						Checkout
					</Button>
				</div>
			</div>
		</div>
	);
}
