"use client";

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { cn } from "@er-octogone-2026/ui/lib/utils";
import { MinusIcon, PlusIcon } from "lucide-react";

type NumberInputProps = Omit<NumberFieldPrimitive.Root.Props, "min"> & {
	min?: number;
	className?: string;
	inputClassName?: string;
	buttonClassName?: string;
};

function NumberInput({
	min = 0,
	className,
	inputClassName,
	buttonClassName,
	...props
}: NumberInputProps) {
	return (
		<NumberFieldPrimitive.Root min={min} {...props}>
			<NumberFieldPrimitive.Group
				data-slot="number-input"
				className={cn("inline-flex h-8 items-stretch rounded-none", className)}
			>
				<NumberFieldPrimitive.Decrement
					data-slot="number-input-decrement"
					className={cn(
						"inline-flex w-8 shrink-0 items-center justify-center rounded-none bg-primary text-primary-foreground outline-none transition-colors hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5",
						buttonClassName,
					)}
				>
					<MinusIcon />
				</NumberFieldPrimitive.Decrement>
				<NumberFieldPrimitive.Input
					data-slot="number-input-input"
					className={cn(
						"h-8 w-full min-w-0 flex-1 border-input border-y bg-transparent px-2.5 py-1 text-center text-xs tabular-nums outline-none transition-colors [appearance:textfield] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:disabled:bg-input/80 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
						inputClassName,
					)}
				/>
				<NumberFieldPrimitive.Increment
					data-slot="number-input-increment"
					className={cn(
						"inline-flex w-8 shrink-0 items-center justify-center rounded-none bg-primary text-primary-foreground outline-none transition-colors hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5",
						buttonClassName,
					)}
				>
					<PlusIcon />
				</NumberFieldPrimitive.Increment>
			</NumberFieldPrimitive.Group>
		</NumberFieldPrimitive.Root>
	);
}

export { NumberInput, type NumberInputProps };
