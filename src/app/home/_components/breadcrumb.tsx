"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

interface Crumb {
	label: string;
	href?: string; // if no href → it becomes the active (grey) item
}

interface BreadcrumbProps {
	items: Crumb[];
	className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
	return (
		<section>
			<div
				className={cn(
					"my-8 flex items-center space-x-2 text-base font-normal text-paragraph",
					className
				)}
			>
				{items.map((item, index) => (
					<div key={index} className="flex items-center space-x-2">
						{/* Link OR Active Label */}
						{item.href ? (
							<Link
								href={item.href}
								className="text-primary hover:text-primary/80"
							>
								{item.label}
							</Link>
						) : (
							<span>{item.label}</span>
						)}

						{/* Add separator except last */}
						{index < items.length - 1 && (
							<span>-</span>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
