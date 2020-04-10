export const netlifyRedirectFilename = "_redirects"
export type NetlifyRedirect = {
    from: string,
    to: string
    status: number
}
export function NetlifyRedirectToString(redirect: NetlifyRedirect): string {
    return redirect.from + "\t\t" + redirect.to + "\t" + redirect.status
}