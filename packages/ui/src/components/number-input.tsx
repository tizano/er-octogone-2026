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
				className={cn(
					"inline-flex h-10 w-fit items-stretch overflow-hidden rounded-md border border-[#d8d2e0] bg-white",
					className,
				)}
			>
				<NumberFieldPrimitive.Decrement
					data-slot="number-input-decrement"
					className={cn(
						"inline-flex w-10 shrink-0 items-center justify-center bg-transparent text-[#1c1a1e] outline-none transition-colors hover:bg-[#f9f5ff] focus-visible:bg-[#f9f5ff] disabled:pointer-events-none disabled:text-[#8b8694] disabled:opacity-60 [&_svg]:size-3.5",
						buttonClassName,
					)}
				>
					<MinusIcon />
				</NumberFieldPrimitive.Decrement>
				<NumberFieldPrimitive.Input
					data-slot="number-input-input"
					className={cn(
						"h-full w-12 min-w-0 border-x border-[#e7e2ed] bg-transparent text-center font-semibold text-sm text-[#1c1a1e] tabular-nums outline-none transition-colors [appearance:textfield] focus-visible:bg-[#f9f5ff] disabled:pointer-events-none disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
						inputClassName,
					)}
				/>
				<NumberFieldPrimitive.Increment
					data-slot="number-input-increment"
					className={cn(
						"inline-flex w-10 shrink-0 items-center justify-center bg-transparent text-[#1c1a1e] outline-none transition-colors hover:bg-[#f9f5ff] focus-visible:bg-[#f9f5ff] disabled:pointer-events-none disabled:text-[#8b8694] disabled:opacity-60 [&_svg]:size-3.5",
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
