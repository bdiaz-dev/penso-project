export default async function getSearch (text) {
  const res = await fetch(`/api/search?searchText=${text}`)
  const data = await res.json()
  return data
}
