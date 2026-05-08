import { requestAgeConfirmation } from '../AgeGate';
import { requestExternalNavigation } from './ExternalLinkDialog';
import { ExplorerFolder, XPApp } from '../types';
import BlogWindow from './blog/BlogWindow';
import AdminWindow from './admin/AdminWindow';
import Farm from './Farm';
import ExplorerWindow from './explorer/ExplorerWindow';

const SPOTIFY_URL = 'https://open.spotify.com/user/31zq2hfnnadnvwfqonhgradbmkae';
const LETTERBOXD_URL = 'https://letterboxd.com/goddessalexism/';
const THRONE_URL = 'https://throne.com/goddessalexism';
const ONLYFANS_URL = 'https://onlyfans.com/goddessalexism';
const LOYALFANS_URL = 'https://www.loyalfans.com/sissyfarm';
const SEXTPANTHER_URL = 'https://www.sextpanther.com/goddess-alexis';
const IWANTCLIPS_URL = 'https://iwantclips.com/store/706666/GoddessAlexism';
const NITEFLIRT_URL = 'https://www.niteflirt.com/GoddessAlexism';
const LOYALFANS_REF_URL = 'https://www.loyalfans.com/?ref=ts1oA7L0zo9j6mQkZjBM2vtyV-2BinfKLAronkogmOVR8';
const LOVENSE_REF_URL = 'https://www.lovense.com/bluetooth-wireless-remote-control-sex-toys';
const DOORDASH_REF_URL = 'https://www.doordash.com/consumer/referred/Alexis-Moore-110496/?utm_source=copy';
const ONLYFANS_REF_URL = 'https://onlyfans.com/?ref=368817';
const SEXTPANTHER_REF_URL = 'https://www.sextpanther.com/apply?id=49865';
const DISCORD_URL = 'https://discord.com/channels/@me';
const X_URL = 'https://x.com/goddessalexism';
const TUMBLR_URL = 'https://soulfuxker.tumblr.com/';

async function openExternalLink(url: string): Promise<void> {
    const ok = await requestExternalNavigation(url);
    if (ok) window.open(url, '_blank', 'noopener,noreferrer');
}

export const FOLDERS: ExplorerFolder[] = [
    { id: 'referrals', label: 'Referrals', icon: { label: 'Referrals', imageSrc: '/icons/folder.png'} },
    { id: 'links', label: 'Links', icon: { label: 'Links', imageSrc: '/icons/folder.png' } },
];

export const APPS: XPApp[] = [
    {
        id: 'myComputer',
        title: 'My Computer',
        icon: { label: 'My Computer', emoji: '🖥️' },
        desktop: true,
        defaultSize: { width: 640, height: 400 },
        render: () => <ExplorerWindow />,
        guard: requestAgeConfirmation
    },
    {
        id: 'blog',
        title: 'My Blog',
        icon: { label: 'My Blog', emoji: '💻' },
        desktop: true,
        defaultSize: { width: 500, height: 650 },
        render: () => <BlogWindow />,
        guard: requestAgeConfirmation,
    },

    {
        id: 'tumblr',
        title: 'Tumblr',
        icon: { label: 'Tumblr', imageSrc: '/icons/tumblr.webp' },
        desktop: true,
        explorerPath: ['links'],
        onActivate: () => openExternalLink(TUMBLR_URL),
    },

    {
        id: 'x',
        title: 'X',
        icon: { label: 'X', imageSrc: '/icons/twitter.webp' },
        desktop: true,
        explorerPath: ['links'],
        onActivate: () => openExternalLink(X_URL),
    },
    {
        id: 'discord',
        title: 'Discord',
        icon: { label: 'Discord', imageSrc: '/icons/discord.webp' },
        desktop: true,
        explorerPath: ['links'],
        onActivate: () => openExternalLink(DISCORD_URL),
    },
    {
        id: 'spotify',
        title: 'Spotify',
        icon: { label: 'Spotify', imageSrc: '/icons/spotify-1.png' },
        desktop: true,
        explorerPath: ['links'],
        onActivate: () => openExternalLink(SPOTIFY_URL),
    },
    {
        id: 'letterboxd',
        title: 'Letterboxd',
        icon: { label: 'Letterboxd', imageSrc: '/icons/letterboxd-mac-icon.png' },
        desktop: true,
        explorerPath: ['links'],
        onActivate: () => openExternalLink(LETTERBOXD_URL),
    },
    
    {
        id: 'throne',
        title: 'Throne',
        icon: { label: 'Throne', imageSrc: '/icons/throne.webp' },
        explorerPath: ['links'],
        onActivate: () => openExternalLink(THRONE_URL),
    },
    {
        id: 'onlyfans',
        title: 'OnlyFans',
        icon: { label: 'OnlyFans', imageSrc: '/icons/onlyfans.webp' },
        explorerPath: ['links'],
        onActivate: () => openExternalLink(ONLYFANS_URL),
    },
    {
        id: 'loyalfans',
        title: 'LoyalFans',
        icon: { label: 'LoyalFans', imageSrc: '/icons/loyalfans.webp' },
        explorerPath: ['links'],
        onActivate: () => openExternalLink(LOYALFANS_URL),
    },
    {
        id: 'sextpanther',
        title: 'SextPanther',
        icon: { label: 'SextPanther', imageSrc: '/icons/sextpanther.webp' },
        explorerPath: ['links'],
        onActivate: () => openExternalLink(SEXTPANTHER_URL),
    },
    {
        id: 'iwantclips',
        title: 'iWantClips',
        icon: { label: 'iWantClips', imageSrc: '/icons/iwantclips.webp' },
        explorerPath: ['links'],
        onActivate: () => openExternalLink(IWANTCLIPS_URL),
    },
    {
        id: 'niteflirt',
        title: 'NiteFlirt',
        icon: { label: 'NiteFlirt', imageSrc: '/icons/niteflirt.webp' },
        explorerPath: ['links'],
        onActivate: () => openExternalLink(NITEFLIRT_URL),
    },
    {
        id: 'loyalfans-ref',
        title: 'LoyalFans (Referral)',
        icon: { label: 'LoyalFans (Ref)', imageSrc: '/icons/loyalfans.webp' },
        explorerPath: ['referrals'],
        onActivate: () => openExternalLink(LOYALFANS_REF_URL),
    },
    {
        id: 'lovense-ref',
        title: 'Lovense (Referral)',
        icon: { label: 'Lovense', imageSrc: '/icons/lovense.webp' },
        explorerPath: ['referrals'],
        onActivate: () => openExternalLink(LOVENSE_REF_URL),
    },
    {
        id: 'doordash-ref',
        title: 'DoorDash (Referral)',
        icon: { label: 'DoorDash', imageSrc: '/icons/doordash.webp' },
        explorerPath: ['referrals'],
        onActivate: () => openExternalLink(DOORDASH_REF_URL),
    },
    {
        id: 'onlyfans-ref',
        title: 'OnlyFans (Referral)',
        icon: { label: 'OnlyFans (Ref)', imageSrc: '/icons/onlyfans.webp' },
        explorerPath: ['referrals'],
        onActivate: () => openExternalLink(ONLYFANS_REF_URL),
    },
    {
        id: 'sextpanther-ref',
        title: 'SextPanther (Referral)',
        icon: { label: 'SextPanther (Ref)', imageSrc: '/icons/sextpanther.webp' },
        explorerPath: ['referrals'],
        onActivate: () => openExternalLink(SEXTPANTHER_REF_URL),
    },
    {
        id: 'sissyFarm',
        title: 'Sissy Farm',
        icon: { label: 'Sissy Farm', imageSrc: '/icons/toy.png' },
        desktop: true,
        defaultSize: { width: 500, height: 650 },
        render: () => <Farm/>,
        guard: requestAgeConfirmation,
    },
];

export const ADMIN_APPS: XPApp[] = [
    {
        id: 'admin',
        title: 'Admin',
        icon: { label: 'Admin', emoji: '🛠️' },
        desktop: true,
        defaultSize: { width: 300, height: 200 },
        render: () => <AdminWindow />,
    },
    ...APPS.map((app): XPApp => {
        if (app.id === 'blog' && app.render) {
            return {
                ...app,
                render: () => <BlogWindow isAdmin />,
            };
        }
        return app;
    }),
]
