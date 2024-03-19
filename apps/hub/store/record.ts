import { type ImmerStateCreator } from '@/store/index'
import { type Record } from '@serverbee/types'

type State = {
    records: Record[]
}

type Action = {
    updateRecord: (record: Record[]) => void
}

export type RecordSlice = State & Action

export const createRecordSlice: ImmerStateCreator<RecordSlice> = (set) => ({
    records: [],
    updateRecord: (record) =>
        set((state) => {
            record?.forEach((r) => {
                const index = state.records.findIndex(
                    (rec) => rec.server_id === r.server_id
                )
                if (index > -1) {
                    state.records[index] = r
                } else {
                    state.records.push(r)
                }
            })
        }),
})
