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
import Delete from "./delete/Delete";
import { ExpandIcon, FileIcon, FilePenIcon } from "lucide-react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
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
					<a
						href={`/user/${path}/create`}
						className={buttonVariants({
							size: "sm",
						})}
					>
						Create
					</a>
				</div>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>id</TableHead>
							<TableHead>Title</TableHead>
							<TableHead>sku</TableHead>
							<TableHead>limit</TableHead>
							<TableHead>price</TableHead>
							<TableHead>published</TableHead>
							<TableHead>actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data
							? data.items.map((item: any, index: number) => {
									return (
										<TableRow key={item.id}>
											<TableCell>{index + 1}</TableCell>
											<TableCell className="font-medium">
												{item.title}
											</TableCell>
											<TableCell>{item.sku}</TableCell>
											<TableCell>{item.limit}</TableCell>
											<TableCell>{item.price}</TableCell>
											<TableCell>{item.published.toString()}</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button size="icon" variant="ghost">
															<ExpandIcon className="h-4 w-4" />
															<span className="sr-only">Actions</span>
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuItem>
															<a
																href={`/user/${path}/${item.id}?view=true`}
																className="flex gap-1"
															>
																<FileIcon className="h-4 w-4 mr-2" />
																View
															</a>
														</DropdownMenuItem>
														<DropdownMenuItem>
															<a
																href={`/user/${path}/${item.id}`}
																className="flex gap-1"
															>
																<FilePenIcon className="h-4 w-4 mr-2" />
																Edit
															</a>
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={(e) => {
																e.preventDefault();
															}}
														>
															<Delete mutate={mutate} id={item.id} />
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
							  })
							: [...Array(10)].map((index: number) => {
									return (
										<TableRow key={index}>
											{[...Array(7)].map((row: number) => {
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
