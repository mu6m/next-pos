"use client";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationPrevious,
	PaginationNext,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpandIcon, FileIcon, FilePenIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { path } from "./config";

export default function DataTable({ searchParams }: any) {
	const fetcher = (url: string) => fetch(url).then((r) => r.json());
	let { data, mutate } = useSWR(
		`/user/${path}/read?${new URLSearchParams(searchParams).toString()}`,
		fetcher
	);
	const router = useRouter();
	const search: string = searchParams.q || "";
	const currentPage: number = Number(searchParams.page) || 1;
	const search_input: any = useRef(null);
	return (
		<Card>
			<CardHeader>
				<CardTitle>{path}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<Input
							type="search"
							placeholder="Search ..."
							className="max-w-xs"
							defaultValue={search}
							ref={search_input}
						/>
						<Button
							size="sm"
							onClick={() => {
								router.push(
									`/user/${path}?${new URLSearchParams({
										...searchParams,
										q: search_input?.current?.value || "",
									}).toString()}`
								);
							}}
						>
							Search
						</Button>
					</div>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>id</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Username</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Type</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data
							? data.items.map((item: any, index: number) => {
									return (
										<TableRow key={item.id}>
											<TableCell>{item.id}</TableCell>
											<TableCell className="font-medium">{item.name}</TableCell>
											<TableCell>{item.username}</TableCell>
											<TableCell>{item.email}</TableCell>
											<TableCell>{item.type}</TableCell>
										</TableRow>
									);
							  })
							: [...Array(10)].map((index: number) => {
									return (
										<TableRow key={index}>
											{[...Array(5)].map((row: number) => {
												return (
													<TableCell key={row}>
														<Skeleton className="h-4 w-[100px]" />
													</TableCell>
												);
											})}
										</TableRow>
									);
							  })}
					</TableBody>
				</Table>
			</CardContent>
			{data && data.items.length == 0 && (
				<CardFooter>
					<div className="mx-auto">
						<div className="text-xs flex gap-1 w-full text-muted-foreground">
							no data.
						</div>
					</div>
				</CardFooter>
			)}
			{data && (
				<CardFooter>
					<div className="flex items-center justify-between">
						<div className="text-xs flex gap-1 w-full text-muted-foreground">
							page <strong>{currentPage}</strong> of{" "}
							<strong>{Math.max(data.pages, 1)}</strong>
						</div>
						<Pagination>
							<PaginationContent>
								{currentPage > 1 && (
									<PaginationItem>
										<PaginationPrevious
											href={`/user/${path}?${new URLSearchParams({
												...searchParams,
												page: currentPage - 1,
											}).toString()}`}
										/>
									</PaginationItem>
								)}
								{currentPage < data.pages && (
									<PaginationItem>
										<PaginationNext
											href={`/user/${path}?${new URLSearchParams({
												...searchParams,
												page: currentPage + 1,
											}).toString()}`}
										/>
									</PaginationItem>
								)}
							</PaginationContent>
						</Pagination>
					</div>
				</CardFooter>
			)}
		</Card>
	);
}
