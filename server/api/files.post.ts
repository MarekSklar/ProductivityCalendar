export default defineEventHandler(async (event) => {
    const { file } = await readBody<{ file: File }>(event)

    await storeFileLocally(
        file.content, // the stringified version of the file
        file.name,    // the name of the file
        '/userFiles'  // the folder the file will be stored in
    )

    // {OR}

    // Parses a data URL and returns an object with the binary data and the file extension.
    const { binaryString, ext } = parseDataUrl(file.content)

    return 'success!'
})

interface File {
    name: string
    content: string
}