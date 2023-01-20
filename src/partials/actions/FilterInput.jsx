import React, { useState, useRef, useEffect } from 'react'
import Transition from '../../utils/Transition'

const defaultProps = {
  type: "text",
  value: "",
  onSelect: () => { },
  defaultValue: {
    "text": "",
    "number": 0
  }
}

function FilterInput(props = defaultProps) {

  const [ dropdownOpen, setDropdownOpen ] = useState(false)
  const [ filterText, setFilterText ] = useState(props.value)

  const trigger = useRef(null)
  const dropdown = useRef(null)

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdownOpen || dropdown.current.contains(target) || trigger.current.contains(target)) return
      setDropdownOpen(false)
    }
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return
      setDropdownOpen(false)
    }
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })

  return (
    <div className="relative inline-flex">
      <button
        ref={ trigger }
        className="btn bg-white dark:bg-dark border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-slate-600 dark:hover:text-slate-200"
        aria-haspopup="true"
        onClick={ () => setDropdownOpen(!dropdownOpen) }
        aria-expanded={ dropdownOpen }
      >
        <span className="sr-only">Filter</span><wbr />
        { props.title && <span className='mr-1' >{ props.title }</span> }
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M9 15H7a1 1 0 010-2h2a1 1 0 010 2zM11 11H5a1 1 0 010-2h6a1 1 0 010 2zM13 7H3a1 1 0 010-2h10a1 1 0 010 2zM15 3H1a1 1 0 010-2h14a1 1 0 010 2z" />
        </svg>
      </button>
      <Transition
        show={ dropdownOpen }
        tag="div"
        className="origin-top-right z-10 absolute top-full left-0 right-auto md:left-auto md:right-0 min-w-56 bg-white dark:bg-dark border border-slate-200 dark:border-slate-700 pt-1.5 rounded shadow-lg overflow-hidden mt-1"
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div ref={ dropdown }>
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-200 uppercase pt-1.5 pb-2 px-4">Filters</div>
          <input type={ props.type } value={ filterText } onChange={ (e) => setFilterText(e.target.value) } className='text-xs text-slate-700 dark:bg-dark dark:text-slate-200 border border-slate-300 dark:border-slate-600 mx-4 my-2 p-2 rounded w-5/6' />
          <div className="py-2 px-3 border-t border-slate-200 dark:border-slate-800 dark:bg-slate-900 bg-slate-50">
            <ul className="flex items-center justify-between">
              <li>
                <button className="btn-xs bg-white dark:bg-dark border-slate-200 dark:border-slate-700  hover:border-slate-300 dark:hover:border-slate-600 text-slate-500 dark:text-slate-300 hover:text-slate-600 dark:hover-text-slate-200">Clear</button>
              </li>
              <li>
                <button className="btn-xs bg-leafy-800 dark:bg-leafy-400 hover:bg-leafy-900 dark:hover:bg-leafy-300 dark:text-black text-white" onClick={ () => {
                  setDropdownOpen(false)

                  if (props.validate(filterText)) {
                    props.onSelect(filterText)
                  } else {
                    alert(props.validateErrorMessage)
                  }


                } } onBlur={ () => setDropdownOpen(false) }>Apply</button>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </div>
  )
}

export default FilterInput
