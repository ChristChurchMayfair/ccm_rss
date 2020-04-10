export const netlifyRedirectFilename = "_redirects"
export type NetlifyRedirect = {
    from: string,
    to: string
    status: number
}
export function toString(redirect: NetlifyRedirect): string {
    return redirect.from + "\t\t" + redirect.to + "\t" + redirect.status
}