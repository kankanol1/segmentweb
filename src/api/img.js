import axios from '@/libs/api.request'

export const segmentImg = imgObject => {
  var file =  imgObject.imgObject;
  return axios.request({
    url: 'img',
    data: {
      file,
    },
    method: 'post'
  })
}
