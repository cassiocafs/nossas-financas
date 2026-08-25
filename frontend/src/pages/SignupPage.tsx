import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router";
import logoHorizontal from "@/assets/brand/logo-horizontal.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

const schema = z
  .object({
    nome: z.string().min(2, "Informe seu nome"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.password === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [erro, setErro] = useState<string | null>(null);
  const [criado, setCriado] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setErro(null);
    try {
      await signUp(values.nome, values.email, values.password);
      setCriado(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha ao criar conta");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="card-surface w-full max-w-sm space-y-5 p-8"
      >
        <div>
          <img src={logoHorizontal} alt="Poupeu" className="h-8 w-auto" />
          <p className="mt-2 text-xs tracking-wide text-muted-foreground uppercase">
            Abrir uma conta
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">Nome</label>
          <input
            type="text"
            {...register("nome")}
            className="w-full rounded-[11px] border border-border bg-muted px-3 py-2 text-[13px] text-foreground"
          />
          {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">E-mail</label>
          <input
            type="email"
            {...register("email")}
            className="w-full rounded-[11px] border border-border bg-muted px-3 py-2 text-[13px] text-foreground"
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">Senha</label>
          <div className="relative">
            <input
              type={mostrarSenha ? "text" : "password"}
              {...register("password")}
              className="w-full rounded-[11px] border border-border bg-muted px-3 py-2 pr-10 text-[13px] text-foreground"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
            >
              {mostrarSenha ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-foreground/80">
            Confirmar senha
          </label>
          <div className="relative">
            <input
              type={mostrarConfirmarSenha ? "text" : "password"}
              {...register("confirmarSenha")}
              className="w-full rounded-[11px] border border-border bg-muted px-3 py-2 pr-10 text-[13px] text-foreground"
            />
            <button
              type="button"
              onClick={() => setMostrarConfirmarSenha((v) => !v)}
              aria-label={mostrarConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
            >
              {mostrarConfirmarSenha ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmarSenha && (
            <p className="text-sm text-destructive">{errors.confirmarSenha.message}</p>
          )}
        </div>

        {erro && <p className="text-sm text-destructive">{erro}</p>}
        {criado && <p className="text-sm text-income">Conta criada! Redirecionando...</p>}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Criando..." : "Criar conta"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-foreground underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
