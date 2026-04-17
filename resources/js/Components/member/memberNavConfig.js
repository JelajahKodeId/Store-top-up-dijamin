/** @typedef {{ label: string, routeName: string, matchRoutes?: string[] }} MemberNavItem */

/** @type {MemberNavItem[]} */
export const memberNavItems = [
    { label: 'Beranda', routeName: 'member.home' },
    { label: 'Paket', routeName: 'member.packages.index', matchRoutes: ['member.packages.show'] },
    { label: 'Pengaturan', routeName: 'member.settings.edit' },
    { label: 'Pesanan', routeName: 'member.orders.index' },
    { label: 'Top up', routeName: 'member.topup.index', matchRoutes: ['member.topup.show'] },
];

export function isMemberNavActive(item) {
    try {
        if (route().current(item.routeName)) {
            return true;
        }
        const extra = item.matchRoutes || [];
        return extra.some((name) => route().current(name));
    } catch {
        return false;
    }
}
