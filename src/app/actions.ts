"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function readNames(formData: FormData) {
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  return { firstName, lastName };
}

async function saveNames(formData: FormData) {
  const { firstName, lastName } = readNames(formData);
  if (!firstName || !lastName) {
    return "Please enter both your first and last name.";
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ first_name: firstName, last_name: lastName, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  return error ? error.message : null;
}

export async function completeWelcome(formData: FormData) {
  const error = await saveNames(formData);
  if (error) {
    redirect(`/welcome?error=${encodeURIComponent(error)}`);
  }
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function updateProfile(formData: FormData) {
  const error = await saveNames(formData);
  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error)}`);
  }
  revalidatePath("/", "layout");
  redirect("/profile?saved=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
