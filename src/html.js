import getElementPos from './functions/get-element-position.js'
import getDocumentHeight from './functions/get-document-height.js'

/**
 * Класс, который занимается отображением HTML контента скроллбара
 */
const HTMLRender = new function() {

    this.container = undefined

    /**
     * Блоки навигации
     */
    this.blocks = []

    this.entered = false

    this.container = document.createElement('div')
    this.container.classList.add('clererscroll--container')

    // На мобильных устройствах нам необходимо первый "тык" отфильтровать, так как
    // он лишь позволяет развернуть панельку и не должен перекидывать человека в другое место
    this.container.addEventListener('mouseenter', event => {
        if (this.entered === false) {
            this.entered = true
            event.stopPropagation()

            return false
        }
    })

    this.container.addEventListener('mouseleave', event => {
        this.entered = false
    })

    /**
     * Загрузить блоки
     */
    this.load = () => {
        this.blocks = []
        this.container.innerHTML = ''

        const contentBlocks = document.querySelectorAll('[data-content-block]')

        if (contentBlocks.length) {
            document.body.appendChild(this.container)

            for (let contentBlock of contentBlocks) {
                this.addNavigationBlock(contentBlock)
            }

            this.setCoords()
        } else {
            console.log('CleverScroll disabled because nothing content blocks')
        }
    }

    this.reload = () => {
        this.stop()
        this.load()
    }

    /**
     * Остановить работу компонента
     */
    this.stop = () => {
        document.body.removeChild(this.container)
    }

    /**
     * Добавить блок в панель навигации
     * @param {HTMLElement} block
     */
    this.addNavigationBlock = block => {
        const scroll       = document.createElement('div')
        const blockTitle   = block.getAttribute('data-content-block')
        const blockClasses = block.getAttribute('data-content-block-classes')

        if (blockClasses) {
            for (let className of blockClasses.split(' ')) {
                scroll.classList.add(className)
            }
        }

        scroll.classList.add('clererscroll--block')
        scroll.classList.add(`clererscroll--block-${this.blocks.length+1}`)
        scroll.appendChild(document.createTextNode(blockTitle))

        this.container.appendChild(scroll)

        scroll.addEventListener('click', event => {
            this.scrollToBlock(block)
        })

        this.blocks.push({
            content : block,
            scroll  : scroll,
            title   : blockTitle
        })
    }

    /**
     * Установить координаты текущим блокам в соответствии с текущим скроллом
     */
    this.setCoords = () => {
        const documentHeight = getDocumentHeight()
        let top = 0

        for (let block of this.blocks) {
            const blockPos = getElementPos(block.content)

            const marginTop = parseFloat(getComputedStyle(block.content).marginTop)
            const marginBottom = parseFloat(getComputedStyle(block.content).marginBottom)
            const topPos =
                (top > 0)
                    ? top
                    : Math.round( ( (blockPos.top - marginTop) / documentHeight) * 100)

            let heightPos = Math.round( ( (blockPos.height + marginBottom) / documentHeight) * 100)

            // Если это последний элемент - заберём всё оставшееся пространство
            // под себя, для красоты
            if (this.blocks.indexOf(block) === (this.blocks.length-1)) {
                heightPos = 100 - topPos
            }

            block.scroll.style.top = `${topPos}%`
            block.scroll.style.height = `${heightPos}%`

            top = (topPos + heightPos)
        }
    }

    this.scrollToBlock = block => {
        const pos = getElementPos(block)

        window.scrollTo(0, pos.top)
    }

}

export default HTMLRender