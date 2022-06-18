console.log('connected')
const deleteProduct = (btn) => {
  let prodId = btn.parentNode.querySelector('[name=productId]').value
  let csrf = btn.parentNode.querySelector('[name=_csrf]').value

  console.log(prodId)
  let productElement = btn.closest('article')
  
  fetch('/admin/products/' + prodId, {
    method: 'delete',
    headers: {
      'csrf-token': csrf
    }
  }).then(result => {
    return result.json()
  }).then(data => {
    productElement.parentNode.removeChild(productElement)
  })
  .catch(err => console.log(err))
}