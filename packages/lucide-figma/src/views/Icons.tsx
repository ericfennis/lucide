import IconButton from '../components/IconButton'
import SearchInput from '../components/SearchInput'
import createIconComponent from '../helpers/createIconComponent'
import { Icon } from '../hooks/useSearch'
import Skeleton from '../components/Skeleton/Skeleton'

interface PageProps {
  query: string
  setQuery: (query:string) => void
  searchResults: Icon[]
  icons: Icon[]
  version: string
  onRefreshClick: () => void
}

const Icons = ({
  query,
  setQuery,
  searchResults,
  onRefreshClick,
  icons,
  version
}: PageProps) => {
  return (
    <>
      <SearchInput
        value={query}
        iconCount={icons.length}
        onChange={(event)  => setQuery(event.target.value)}
        placeholder={icons.length ? `Search ${icons.length} icons`: 'Loading icons ..'}
      />
        <main>
          <div className='icon-grid'>
            {icons.length ? (
              searchResults.map(([name, iconNode]: any) => (
                <IconButton
                  name={name}
                  key={name}
                  component={createIconComponent(name, iconNode)}
                />
              ))
            ) : (
              <Skeleton />
            )}

          </div>
          <footer>
            <a
              href="https://lucide.dev"
              target="_blank"
              className='footer-link'
            >
              Lucide v{version}
            </a>
            <button className="button outlined" onClick={onRefreshClick}>
              Refresh Icons
            </button>
          </footer>
        </main>
    </>
  )
}

export default Icons
