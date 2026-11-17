import { signOut } from "@/lib/actions/auth-actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="rounded-full border-[1.5px] border-ink px-5 py-2.5 text-[15px] font-bold hover:bg-ink hover:text-white">
        Abmelden
      </button>
    </form>
  );
}
