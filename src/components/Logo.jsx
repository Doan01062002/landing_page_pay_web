import { site } from '../data/site.js'

export default function Logo() {
  return (
    <span className="logo">
      <img className="logo__img" src={site.logo} alt={`${site.brand} – ${site.domain}`} width="227" height="65" />
      <span className="logo__tag">{site.tagline}</span>
    </span>
  )
}
