export const siteConfig = {
    name: "StayKedarnath",
    description: "Your trusted guide for Kedarnath & Char Dham Yatra.",
    mainNav: [
        {
            title: "Home",
            href: "/",
        },
        {
            title: "Compare Stays",
            href: "/compare-cities",
        },
        {
            title: "Plan Yatra",
            href: "/itinerary", // Will link to the new universal engine
        }
    ],
    destinations: [
        {
            id: 'kedarnath',
            name: 'Kedarnath',
            slug: 'kedarnath',
            default: true
        },
        {
            id: 'badrinath',
            name: 'Badrinath',
            slug: 'badrinath'
        },
        {
            id: 'gangotri',
            name: 'Gangotri',
            slug: 'gangotri'
        },
        {
            id: 'yamunotri',
            name: 'Yamunotri',
            slug: 'yamunotri'
        }
    ]
}
