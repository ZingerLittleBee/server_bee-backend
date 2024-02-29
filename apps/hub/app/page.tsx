import { unstable_noStore as noStore } from 'next/cache'

import PanelLayout from '@/app/panel/layout'
import PanelPage from '@/app/panel/page'
import { getData } from '@/app/server/server-action'

export default async function Home() {
    noStore()
    const { groups } = await getData()

    return (
        <PanelLayout>
            <PanelPage groups={groups} />
        </PanelLayout>
    )
}
