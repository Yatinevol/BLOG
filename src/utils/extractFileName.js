const extractFileNameFromUrl=function(url){
    // this splits the string into parts separated by /
    const partsArr = url.split('/')
    const partsOfLast = partsArr[partsArr.length - 1].split('.')

    const fileName = partsOfLast[0];
    return fileName;
}
export default extractFileNameFromUrl;