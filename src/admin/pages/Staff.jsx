// Nhân viên & phân quyền: danh sách nhân viên, ma trận quyền theo vai trò, nhật ký thao tác.
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAdmin, useCollection, useDoc } from '../store.jsx'
import { Card, PageHead, Tabs } from '../ui.jsx'
import { fmtDateTime, initials, norm } from '../lib.js'
import { getSchema } from '../schemas.jsx'
import { moduleLabel } from '../modules.js'
import Resource from './Resource.jsx'

const LEVELS = [
  { v: 'none', l: 'Không' },
  { v: 'view', l: 'Xem' },
  { v: 'edit', l: 'Thêm / sửa' },
  { v: 'full', l: 'Toàn quyền' },
]

export default function Staff() {
  const { site, store } = useAdmin()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState(params.get('tab') === 'log' ? 'log' : params.get('tab') === 'roles' ? 'roles' : 'list')
  const ctx = useMemo(() => ({ site, store, read: (c) => store.read(c) }), [site, store])
  const schema = useMemo(() => getSchema('staff', ctx), [ctx])
  const items = [
    { id: 'list', label: 'Nhân viên' },
    { id: 'roles', label: 'Phân quyền' },
    { id: 'log', label: 'Nhật ký hoạt động' },
  ]
  const change = (t) => {
    setTab(t)
    params.delete('tab')
    setParams(params, { replace: true })
  }
  return (
    <>
      <div className="adm-subnav">
        <Tabs items={items} value={tab} onChange={change} />
      </div>
      {tab === 'list' && <Resource schema={schema} />}
      {tab === 'roles' && <Roles />}
      {tab === 'log' && <Log />}
    </>
  )
}

function Roles() {
  const { site, store, toast } = useAdmin()
  const saved = useDoc('roles')
  const [draft, setDraft] = useState(saved)
  useEffect(() => setDraft(saved), [saved])
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const staff = store.read('staff')
  return (
    <div className="adm-page">
      <PageHead title="Phân quyền" sub="Vai trò nào được xem / sửa chức năng nào">
        <button type="button" className="adm-btn" disabled={!dirty} onClick={() => setDraft(saved)}>
          Hoàn tác
        </button>
        <button type="button" className="adm-btn adm-btn--primary" disabled={!dirty} onClick={() => (store.setDoc('roles', draft, 'đã cập nhật phân quyền'), toast('Đã lưu phân quyền'))}>
          Lưu phân quyền
        </button>
      </PageHead>
      <Card pad={false}>
        <div className="adm-tablewrap">
          <table className="adm-table adm-table--matrix">
            <thead>
              <tr>
                <th>Chức năng</th>
                {draft.roles.map((r) => (
                  <th key={r}>
                    {r}
                    <small>{staff.filter((s) => s.role === r).length} người</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {site.modules.map((m) => (
                <tr key={m.id}>
                  <th scope="row">{moduleLabel(site, m.id)}</th>
                  {draft.roles.map((r) => {
                    const locked = r === 'Quản trị viên'
                    const v = locked ? 'full' : draft.perms[r]?.[m.id] || 'none'
                    return (
                      <td key={r}>
                        <select
                          value={v}
                          disabled={locked}
                          className={`adm-perm adm-perm--${v}`}
                          aria-label={`${r} – ${moduleLabel(site, m.id)}`}
                          onChange={(e) => setDraft({ ...draft, perms: { ...draft.perms, [r]: { ...draft.perms[r], [m.id]: e.target.value } } })}
                        >
                          {LEVELS.map((l) => (
                            <option key={l.v} value={l.v}>
                              {l.l}
                            </option>
                          ))}
                        </select>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="adm-foot-note">Quản trị viên luôn có toàn quyền. Khi triển khai thật, nhân viên đăng nhập bằng tài khoản riêng và chỉ thấy chức năng được cấp.</p>
    </div>
  )
}

function Log() {
  const list = useCollection('activity')
  const [q, setQ] = useState('')
  const rows = q ? list.filter((a) => norm(a.user + ' ' + a.text).includes(norm(q))) : list
  return (
    <div className="adm-page">
      <PageHead title="Nhật ký hoạt động" sub={`${list.length} thao tác gần nhất`} />
      <Card>
        <div className="adm-toolbar">
          <label className="adm-search">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo người hoặc thao tác…" aria-label="Tìm nhật ký" />
          </label>
        </div>
        <ul className="adm-feed adm-feed--full">
          {rows.map((a) => (
            <li key={a.id}>
              <span className="adm-avatar adm-avatar--sm">{initials(a.user, 1)}</span>
              <p>
                <b>{a.user}</b> {a.text}
                <time>{fmtDateTime(a.at)}</time>
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
