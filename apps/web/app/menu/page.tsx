import { apiGet } from "@/lib/api";

import { BusinessMenu } from "@/types/menu";
import { MenuExperience } from "@/components/MenuExperience";

export const revalidate = 60;

export default async function MenuPage() {
  const menu = await apiGet<BusinessMenu>("/menu");

  return <MenuExperience menu={menu} />;
}
