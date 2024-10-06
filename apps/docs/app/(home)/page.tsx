import Button from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";
import MoductorLogo from "@/components/moductor-logo";
import { Blocks, Cpu, Heart, Library, SquareTerminal } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <main className="grow">
        <header className="container flex flex-col items-center gap-12 pb-32 pt-24">
          <h1 className="font-accent text-center text-5xl font-medium sm:text-6xl">
            <span className="text-amber-600 dark:text-amber-500">
              DNS records
            </span>{" "}
            in your code
          </h1>
          <Button asChild>
            <Link href="/docs/core">
              <Library className="mr-2 size-4" />
              Get Started
            </Link>
          </Button>
        </header>
        <section className="container grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center">
                <Cpu className="mr-2 size-6 text-amber-600 drop-shadow-md dark:text-amber-500" />
                Compatible
              </CardTitle>
              <CardDescription>Can run anywhere</CardDescription>
            </CardHeader>
            <CardContent>
              PolyDNS supports vanilla JavaScript, TypeScript and even any
              JavaScript runtime.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center">
                <Blocks className="mr-2 size-6 text-purple-600 drop-shadow-md dark:text-purple-500" />
                Extendable
              </CardTitle>
              <CardDescription>Supports anything</CardDescription>
            </CardHeader>
            <CardContent>
              Use PolyDNS with any DNS provider you want. You can even simply
              write your own.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="inline-flex items-center">
                <SquareTerminal className="mr-2 size-6 text-sky-600 drop-shadow-md dark:text-sky-500" />
                CLI
              </CardTitle>
              <CardDescription>Runs in your terminal</CardDescription>
            </CardHeader>
            <CardContent>
              Manage DNS records from config files, that can be pushed to Git
              and deployed by CI.
            </CardContent>
          </Card>
        </section>
      </main>
      <footer className="container py-6 text-center text-sm leading-none opacity-60">
        built with{" "}
        <Heart
          className="inline-block size-4 align-text-bottom text-red-500"
          aria-hidden
        />{" "}
        <span className="sr-only">love</span>
        by{" "}
        <a href="https://moductor.dev/">
          <MoductorLogo
            className="inline-block h-4 fill-current pb-0.5 align-text-bottom"
            aria-hidden
          />
          <span className="sr-only">Moductor</span>
        </a>{" "}
        in {new Date().getFullYear()}
      </footer>
    </>
  );
}
