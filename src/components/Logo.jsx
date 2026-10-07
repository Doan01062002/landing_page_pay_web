import { useSite } from '../lib/siteData.jsx'

export default function Logo() {
  const site = useSite()
  return (
    <span className="logo">
      <img className="logo__img" src={site.logo} alt={`${site.brand} – ${site.domain}`} width="227" height="65" />
      <span className="logo__tag">{site.tagline}</span>
    </span>
  )
}
