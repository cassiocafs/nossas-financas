import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setErro(null);
    try {
      await signIn(values.email, values.password);
      navigate("/");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao entrar");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="card-surface w-full max-w-sm space-y-5 p-8"
      >
        <div>
          <p className="font-display text-2xl font-semibold text-foreground">
            Nossas Finanças
          </p>
          <p className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
            Entrar na conta
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">E-mail</label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">Senha</label>
          <input
            type="password"
            {...register("password")}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/signup" className="font-medium text-foreground underline">
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
