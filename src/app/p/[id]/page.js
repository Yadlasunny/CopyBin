import { prisma } from '@/lib/prisma';
import { consumePasteViewTx } from '@/lib/pastes';
import { notFound } from 'next/navigation';

import Link from 'next/link';

import { formatDateTimeIST } from '@/utils/time';

import ClientActions from './ClientActions';
import styles from './page.module.css';

export default async function PastePage({ params }) {
    const { id } = await params;

    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
        return consumePasteViewTx(tx, { id, now });
    });

    if (!result) {
        notFound();
    }

    const expiresAtText = result.expires_at ? formatDateTimeIST(result.expires_at) : null;
    const remainingViewsText =
        result.remaining_views == null ? 'unlimited' : String(result.remaining_views);

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <h1 className={styles.title}>Paste</h1>
                        <div className={styles.actions}>
                            <Link className={styles.link} href="/">
                                Create another
                            </Link>
                        </div>
                    </div>

                    <ClientActions id={id} />
                </div>

                <div className={styles.meta}>
                    <div>Expires at: {expiresAtText ?? 'never'}</div>
                    <div>Remaining views: {remainingViewsText}</div>
                </div>

                <div className={styles.codeBox}>
                    <pre className={styles.pre}>{result.content}</pre>
                </div>
            </main>
        </div>
    );
}
