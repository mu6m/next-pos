import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

function Option({ index }: any) {
	const methods = useFormContext();
	const feature = methods.watch(`feature.${index}`);

	const [option, setOption] = useState(feature?.option?.length || 0);
	return (
		<div className="flex flex-col gap-4 items-center space-x-2">
			<div className="grid w-full max-w-sm items-center gap-1.5">
				<label>options</label>
				<Input
					type="number"
					min={0}
					value={option}
					{...methods.register(`feature.${index}.optionCount`, {
						onChange: (e) => setOption(Number(e.target.value)),
					})}
					required
				/>
			</div>
			{[...Array(option)].map((e, j) => (
				<div key={j} className="border rounded-sm p-4 flex flex-col gap-4">
					<div className="grid w-full max-w-sm items-center gap-1.5">
						<label>option</label>
						<Input {...methods.register(`feature.${index}.option.${j}`)} />
					</div>
					<div className="grid w-full max-w-sm items-center gap-1.5">
						<label>price</label>
						<Input
							{...methods.register(`feature.${index}.priceAddOptions.${j}`, {
								valueAsNumber: true,
							})}
							type="number"
							min={0}
						/>
					</div>
				</div>
			))}
		</div>
	);
}

enum types {
	CHECKBOX = "CHECKBOX",
	TEXT = "TEXT",
	OPTION = "OPTION",
}
export function Feature({ index }: any) {
	const methods = useFormContext();
	const featureType = methods.watch(`feature.${index}.type`);
	return (
		<div className="flex flex-col gap-4">
			<div className="grid w-full max-w-sm items-center gap-1.5">
				<label>name</label>
				<Input {...methods.register(`feature.${index}.name`)} type="text" />
			</div>

			<div className="flex items-center space-x-2">
				<input
					{...methods.register(`feature.${index}.required`)}
					type="checkbox"
					value=""
					className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
				/>
				<label className="ms-2 text-sm font-medium text-gray-900 ">
					required
				</label>
			</div>
			<div className="flex items-center space-x-2">
				<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
					Type
				</label>
				<select
					{...methods.register(`feature.${index}.type`)}
					className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
				>
					{Object.values(types).map((t) => {
						return (
							<option value={t} key={t}>
								{t}
							</option>
						);
					})}
				</select>
			</div>
			{featureType === "OPTION" ? (
				<Option index={index} />
			) : (
				<div className="grid w-full max-w-sm items-center gap-1.5">
					<label>price add</label>
					<Input
						type="number"
						min={0}
						{...methods.register(`feature.${index}.priceAdd`, {
							valueAsNumber: true,
						})}
					/>
				</div>
			)}
		</div>
	);
}
