import Mock from 'mockjs'
const Random = Mock.Random
export const segmentImg = (req,res) => {
  var file = req.body.get('file');
  var base64 = req.body.get('base64');
  return {file,base64};
}
