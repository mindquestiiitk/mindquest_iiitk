interface NavItemData {
  href: string;
  ariaLabel: string;
  title: string;
  text: string;
}

const navItems: NavItemData[] = [
  { href: "/", ariaLabel: "Home", title: "Home", text: "Home" },
  { href: "/merch", ariaLabel: "Merch", title: "Merch", text: "Merch" },
  { href: "/teams", ariaLabel: "Team", title: "Team", text: "Our Team" },
  { href: "/events", ariaLabel: "Events", title: "Events", text: "Events" },
  /*{ href: "/", ariaLabel: "Chat", title: "Chat", text: "Chat" },*/
];

export default navItems;
