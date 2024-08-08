"use client";

import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { Link } from "lucide-react";
import React, { useState } from "react";
import useSWR from "swr";

export default function Comp() {
	const fetcher = (url: string) =>
		fetch(url, { method: "POST" }).then((r) => r.json());
	let { data, isLoading } = useSWR(`/user/data/`, fetcher);
	console.log(data);
	if (isLoading) {
		return <ReloadIcon className="h-4 w-4 animate-spin mx-auto my-60" />;
	}
	return <div className="flex flex-col gap-4 max-w-xl w-full mx-auto"></div>;
}
