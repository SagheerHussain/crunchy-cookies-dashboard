// src/hooks/useLiveSalesBreakdown.js
import { useEffect, useState } from 'react';

export default function useLiveSalesBreakdown({ intervalMs = 10000, tz = 'UTC', status = 'delivered', dateField = 'createdAt' } = {}) {
    const [data, setData] = useState(null);

    useEffect(() => {
        let timer, aborted = false;

        const load = async () => {
            try {
                const qs = new URLSearchParams({ tz, status, dateField }).toString();
                const res = await fetch(`http://localhost:5000/api/v1/analytics/sales?${qs}`, {
                    cache: 'no-store', // avoid browser cache
                    headers: { 'Cache-Control': 'no-store' }
                });
                const json = await res.json();
                if (!aborted) setData(json);
            } catch (e) {
                console.error('sales-breakdown fetch error:', e);
            }
        };

        load();
        timer = setInterval(load, intervalMs);
        return () => { aborted = true; clearInterval(timer); };
    }, [intervalMs, tz, status, dateField]);

    return data;
}
