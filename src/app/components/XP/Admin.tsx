import XPDesktop from './XPDesktop';
import "../../index.css";
import "xp.css/dist/XP.css";
import "../../App.css";
import { ADMIN_APPS } from './apps';

export default function AdminXP() {
    return <XPDesktop apps={ADMIN_APPS} />
}