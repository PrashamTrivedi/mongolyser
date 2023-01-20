import React, { useState, useRef, useEffect } from 'react'
import Transition from '../../utils/Transition'

function FilterButton({ title, options = [], onSelect, ...props }) {
  const [ dropdownOpen, setDropdownOpen ] = useState(false)
  const [ optionsFilterText, setOptionsFilterText ] = useState("")
  const [ originalOptions, setOriginalOptions ] = useState([])
  const [ displayOptions, setDisplayOptions ] = useState([])
  const [ selectedOptions, setSelectedOptions ] = useState([])

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

  useEffect(() => {

    function handleEvent() {
      console.log("handling event clearfilters")
      setSelectedOptions([])
    }

    document.addEventListener('mongolyser:clearfilters', handleEvent)
    return () => {
      document.removeEventListener('mongolyser:clearfilters', handleEvent)
    }
  })

  useEffect(() => {
    setOriginalOptions(options)
    setDisplayOptions(options.slice(0, 6))
  }, [])

  function onOptionsFilter(text) {

    // set options filter text
    setOptionsFilterText(text)

    // check if string is empty
    if (String(text) === "") {
      const output = originalOptions.length <= 0 ? options.slice(0, 6) : originalOptions.slice(0, 6)
      setDisplayOptions(Array.from(new Set([ ...selectedOptions, ...output ])))
      return
    }

    // make sure string is atleast 3 chars long
    if (String(text).length < 3) {
      console.log("Found Text value", text, "Returning")
      return
    }

    let filteredOptions = originalOptions.filter(str => new RegExp(text).test(str)).slice(0, 6)
    setDisplayOptions(Array.from(new Set([ ...selectedOptions, ...filteredOptions ])))
  }

  function onSelectOptions(option) {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(t => t !== option))
    } else {
      setSelectedOptions([ ...selectedOptions, option ])
    }
  }

  useEffect(() => {
    onOptionsFilter(optionsFilterText)
  }, [ selectedOptions ])

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

        { title && <span className='mr-1' >{ title } { selectedOptions.length > 0 && `(${selectedOptions.length})` }</span> }
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M9 15H7a1 1 0 010-2h2a1 1 0 010 2zM11 11H5a1 1 0 010-2h6a1 1 0 010 2zM13 7H3a1 1 0 010-2h10a1 1 0 010 2zM15 3H1a1 1 0 010-2h14a1 1 0 010 2z" />
        </svg>
      </button>
      <Transition
        show={ dropdownOpen }
        tag="div"
        className="origin-top-right z-10 absolute top-full left-0 right-auto md:left-auto md:right-0 min-w-56 bg-white dark:bg-dark border border-slate-200 dark:border-slate-800 pt-1.5 rounded shadow-lg overflow-hidden mt-1"
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-out duration-200"
        leaveStart="opacity-100"
        leaveEnd="opacity-0"
      >
        <div ref={ dropdown }>
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-300 uppercase pt-1.5 pb-2 px-4">Filters { `(${originalOptions.length})` }</div>
          {
            originalOptions.length > 6 && (
              <input value={ optionsFilterText } onChange={ (e) => onOptionsFilter(e.target.value) } className='text-xs text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 mx-4 my-2 p-2 rounded w-5/6' />
            )
          }
          <ul className="mb-4">
            {

              displayOptions.map(option => {
                return (
                  <li key={ option } className="font-inter py-1 px-3">
                    <label className="flex items-center">
                      <input onChange={ e => { onSelectOptions(option) } } type="checkbox" className="form-checkbox" checked={ selectedOptions.includes(option) } />
                      <span className="text-sm dark:text-white font-medium ml-2">{ option }</span>
                    </label>
                  </li>
                )
              })
            }
          </ul>
          <div className="py-2 px-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <ul className="flex items-center justify-between">
              <li>
                <button className="btn-xs bg-white dark:bg-dark border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-500 dark:text-slate-400  hover:text-slate-600 dark:hover:text-slate-300">Clear</button>
              </li>
              <li>
                <button className="btn-xs bg-leafy-800 dark:bg-leafy-400 hover:bg-leafy-900 dark:hover:bg-leafy-300 text-white dark:text-black" onClick={ () => {
                  setDropdownOpen(false)
                  onSelect(selectedOptions)
                } } onBlur={ () => setDropdownOpen(false) }>Apply</button>
              </li>
            </ul>
          </div>
        </div>
      </Transition>
    </div>
  )
}

export default FilterButton
