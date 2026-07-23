import { http } from '../request.ts'
import type {
  ApplicationSearchItem,
  NoticeSearchItem,
  SearchPage,
} from './search.types.ts'

const SEARCH_PATH = '/api/intelligence/search'

export const searchService = {
  searchNotices: (keyword: string, pageSize: number) =>
    http.get<SearchPage<NoticeSearchItem>>(`${SEARCH_PATH}/notices`, {
      params: { keyword, page: 1, pageSize },
    }),
  searchApplications: (keyword: string, pageSize: number) =>
    http.get<SearchPage<ApplicationSearchItem>>(`${SEARCH_PATH}/applications`, {
      params: { keyword, page: 1, pageSize },
    }),
}
