import { useOperation } from "@/hooks/useOperation";
import Link from "next/link";

const OperationCard = ({ operationId }: { operationId: string }) => {
  const { data: operation, isLoading, isError } = useOperation(operationId);

  if (isLoading) return <div>Loading operation...</div>;
  if (isError) return <div>Error loading operation.</div>;
  if (!operation) return <div>Operation not found.</div>;

  return (
    <li className="mb-2 rounded border border-gray-200 p-2 hover:bg-gray-100">
      <Link legacyBehavior href={`/operations/${operation.id}`}>
        <a className="text-blue-500 hover:underline">
          {operation.procedureName} on{" "}
          {new Date(operation.procedureDate).toLocaleDateString()}
        </a>
      </Link>
    </li>
  );
};

export default OperationCard;
