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
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 dark:bg-paper-night">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm space-y-5 border border-line bg-surface p-8 dark:border-line-night dark:bg-surface-night"
      >
        <div>
          <p className="font-display text-2xl font-semibold text-ink dark:text-paper">
            Nossas Finanças
          </p>
          <p className="mt-1 font-mono text-xs tracking-wide text-ink/50 uppercase dark:text-paper/50">
            Entrar na conta
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-ink/80 dark:text-paper/80">
            E-mail
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:text-paper"
          />
          {errors.email && (
            <p className="text-sm text-vermelho dark:text-vermelho-night">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-ink/80 dark:text-paper/80">
            Senha
          </label>
          <input
            type="password"
            {...register("password")}
            className="w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm text-ink dark:border-line-night dark:text-paper"
          />
          {errors.password && (
            <p className="text-sm text-vermelho dark:text-vermelho-night">{errors.password.message}</p>
          )}
        </div>

        {erro && <p className="text-sm text-vermelho dark:text-vermelho-night">{erro}</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>

        <p className="text-center text-sm text-ink/60 dark:text-paper/60">
          Não tem conta?{" "}
          <Link to="/signup" className="font-medium text-ink underline dark:text-paper">
            Criar conta
          </Link>
        </p>
      </form>
    </div>
  );
}
