(num) => num + '....'

(str) => {
  if (String(str).includes('....')) {
    return str.slice(0, -4)
  } else {
    return str
  }
}