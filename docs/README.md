## Modules

<dl>
<dt><a href="#module_sharedBuilder">sharedBuilder</a> ⇒</dt>
<dd><p>shared builder to create fmpooljs instance.</p>
</dd>
<dt><a href="#module_fmpooljs">fmpooljs</a> ⇒</dt>
<dd><p>fmpooljs uses jquery to select elements from the DOM.</p>
</dd>
</dl>

<a name="module_sharedBuilder"></a>

## sharedBuilder ⇒
shared builder to create fmpooljs instance.

**Returns**: fmpooljs object  

| Param | Type | Description |
| --- | --- | --- |
| win | <code>\*</code> | browser windwo |
| jq | <code>\*</code> | jquery |
| frame | <code>\*</code> | optional: current frame |

<a name="module_fmpooljs"></a>

## fmpooljs ⇒
fmpooljs uses jquery to select elements from the DOM.

**Returns**: fmpooljs object  

| Param | Type | Description |
| --- | --- | --- |
| selector | <code>string</code> | CSS selector |
| context | <code>\*</code> | Contex |


* [fmpooljs](#module_fmpooljs) ⇒
    * _static_
        * [.setSessionItem(key, val)](#module_fmpooljs.setSessionItem)
        * [.getSessionItem(key)](#module_fmpooljs.getSessionItem) ⇒
        * [.unevenCompare(value)](#module_fmpooljs.unevenCompare) ⇒
        * [.evenCompare(value)](#module_fmpooljs.evenCompare) ⇒
        * [.enableLogging()](#module_fmpooljs.enableLogging)
        * [.disableLogging()](#module_fmpooljs.disableLogging)
    * _inner_
        * [~readonly()](#module_fmpooljs..readonly) ⇒
        * [~clear()](#module_fmpooljs..clear) ⇒
        * [~countAmountOfElements()](#module_fmpooljs..countAmountOfElements) ⇒
        * [~saveAmountIfElementsToSession(key)](#module_fmpooljs..saveAmountIfElementsToSession) ⇒
        * [~readonlyOnSessionCondition(key, predict)](#module_fmpooljs..readonlyOnSessionCondition) ⇒
        * [~saveValueToStore(key)](#module_fmpooljs..saveValueToStore) ⇒
        * [~saveFieldValueToStore(key)](#module_fmpooljs..saveFieldValueToStore) ⇒
        * [~getFieldValue()](#module_fmpooljs..getFieldValue) ⇒
        * [~clearOnSessionValueCondition(key, predict)](#module_fmpooljs..clearOnSessionValueCondition) ⇒
        * [~prefillFromStore(key)](#module_fmpooljs..prefillFromStore) ⇒

<a name="module_fmpooljs.setSessionItem"></a>

### fmpooljs.setSessionItem(key, val)
**Kind**: static method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: set value into session storage  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key of session storage |
| val | <code>String</code> | value of session storage |

<a name="module_fmpooljs.getSessionItem"></a>

### fmpooljs.getSessionItem(key) ⇒
**Kind**: static method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: save value to session storage  
**Returns**: value of session storage  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>\*</code> | key of session storage |

<a name="module_fmpooljs.unevenCompare"></a>

### fmpooljs.unevenCompare(value) ⇒
**Kind**: static method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: returns a function for uneven comparison  
**Returns**: function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | value to compare with |

<a name="module_fmpooljs.evenCompare"></a>

### fmpooljs.evenCompare(value) ⇒
**Kind**: static method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: returns a function for even comparison  
**Returns**: function  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | value to compare with |

<a name="module_fmpooljs.enableLogging"></a>

### fmpooljs.enableLogging()
**Kind**: static method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: activats logging  
**Access**: public  
<a name="module_fmpooljs.disableLogging"></a>

### fmpooljs.disableLogging()
**Kind**: static method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: deactivats logging  
**Access**: public  
<a name="module_fmpooljs..readonly"></a>

### fmpooljs~readonly() ⇒
Works only with fields which are configured with "Allowed select actions: 'Pop-up and autosuggest'"

**Kind**: inner method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: Sets field to readonly  
**Returns**: fmpooljs object  
**Access**: public  
<a name="module_fmpooljs..clear"></a>

### fmpooljs~clear() ⇒
**Kind**: inner method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: Empties an input field  
**Returns**: fmpooljs  
**Access**: public  
<a name="module_fmpooljs..countAmountOfElements"></a>

### fmpooljs~countAmountOfElements() ⇒
**Kind**: inner method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: counts elements of given selector  
**Returns**: amount of elements  
**Access**: public  
<a name="module_fmpooljs..saveAmountIfElementsToSession"></a>

### fmpooljs~saveAmountIfElementsToSession(key) ⇒
**Kind**: inner method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: saves the amount of elements to a session variable  
**Returns**: fmpooljs object  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | name of the session variable |

<a name="module_fmpooljs..readonlyOnSessionCondition"></a>

### fmpooljs~readonlyOnSessionCondition(key, predict) ⇒
**Kind**: inner method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: Compares the value of the session storage to a given predict and set the element readonly when condition is met.  
**Returns**: fmpooljs object  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | Key of session to of the value to read |
| predict | <code>function</code> | Function for comparison |

<a name="module_fmpooljs..saveValueToStore"></a>

### fmpooljs~saveValueToStore(key) ⇒
**Kind**: inner method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: save the input value of the element into the session storage  
**Returns**: fmpooljs object  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key of the session storage |

<a name="module_fmpooljs..saveFieldValueToStore"></a>

### fmpooljs~saveFieldValueToStore(key) ⇒
**Kind**: inner method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: saves the value of the current selected field to the given session storage  
**Returns**: fmpooljs object  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key of the session storage |

<a name="module_fmpooljs..getFieldValue"></a>

### fmpooljs~getFieldValue() ⇒
**Kind**: inner method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: gets the value of the input within the selector.  
**Returns**: value of the input field  
**Access**: public  
<a name="module_fmpooljs..clearOnSessionValueCondition"></a>

### fmpooljs~clearOnSessionValueCondition(key, predict) ⇒
**Kind**: inner method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: Clears input field when predict for value of given session storage key validates to true.  
**Returns**: fmpooljs object  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key of the session storage |
| predict | <code>function</code> | compare function |

<a name="module_fmpooljs..prefillFromStore"></a>

### fmpooljs~prefillFromStore(key) ⇒
**Kind**: inner method of [<code>fmpooljs</code>](#module_fmpooljs)  
**Summary**: prefills field from storage and uses fillAutoCompleteTextField function  
**Returns**: fmpooljs object  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | key of session storage |

