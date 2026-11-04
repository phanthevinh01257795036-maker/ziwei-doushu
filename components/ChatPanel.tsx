'use client';
import InsightPanel from './InsightPanel';
import type {ZiweiChart} from '../lib/ziwei/types';
/** Compatibility component: facts only, no chat, endpoint, credentials or model. */
export default function ChatPanel({chart}:{chart:ZiweiChart}) {return <InsightPanel chart={chart}/>;}
