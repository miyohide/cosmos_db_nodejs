const CosmosClient = require("@azure/cosmos").CosmosClient
const config = require("./config")

const newItem = {
  id: "3",
  category: "fun",
  name: "Cosmos DB",
  description: "Complete Cosmos DB Node.js Quickstart ⚡",
  isComplete: false
}

async function main() {
  const { endpoint, databaseId, containerId } = config
  let key = null
  try {
    if (process.env.COSMOSDB_KEY) {
      key = process.env.COSMOSDB_KEY
    } else {
      throw new Error('環境変数COSMOSDB_KEYが設定されていません')
    }
  } catch (error) {
    console.log(error.message)
    return
  }

  const client = new CosmosClient({ endpoint, key })

  const database = client.database(databaseId)
  const container = database.container(containerId)

  // SELECTを発行してデータを表示する
  const { resources: items } = await container.items.query('SELECT * FROM c').fetchAll()
  items.forEach(item => {
    console.log(`${item.id} - ${item.description}`)
  })

  // 新しいアイテムを追加する
  const { resource: createdItem } = await container.items.create(newItem)
  console.log(`\r\nCreated new item: ${createdItem.id} - ${createdItem.description}\r\n`)

  // 追加したアイテムに対して更新処理を実施する
  const { id } = createdItem
  createdItem.isComplete = true
  const { resource: updatedItem } = await container.item(id).replace(createdItem)
  console.log(`Updated item: ${updatedItem.id} - ${updatedItem.description}`)
  console.log(`Updated isComplete to ${updatedItem.isComplete}\r\n`)

  // データ削除する
  const { resource: result } = await container.item(id).delete()
  console.log(`Deleted item with id: ${id}`)
}

main()
