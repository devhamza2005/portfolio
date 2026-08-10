import { FileQuestion } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/skeleton";

export default function AdminNotFound() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <EmptyState
        icon={<FileQuestion />}
        title="Page introuvable"
        description="Cette section n'existe pas, ou l'élément demandé a été supprimé."
        action={
          <Button asChild size="sm">
            <Link href="/admin">Retour au tableau de bord</Link>
          </Button>
        }
      />
    </div>
  );
}
