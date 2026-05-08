import XPDesktop from './XPDesktop';
import "../../index.css";
import "xp.css/dist/XP.css";
import "../../App.css";
import { APPS } from './apps';

export default function XP() {
    return <XPDesktop apps={APPS} />
}